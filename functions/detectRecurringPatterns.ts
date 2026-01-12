import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return Response.json({ error: 'Missing opportunityId' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Get all transactions
    const transactions = await base44.asServiceRole.entities.BankTransaction.filter({
      opportunity_id: opportunityId
    });

    if (transactions.length === 0) {
      return Response.json({ error: 'No transactions found' }, { status: 400 });
    }

    // Sort by date
    transactions.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

    // Group by similar descriptions using fuzzy matching
    const clusters = clusterTransactions(transactions);

    // Analyze each cluster for recurring patterns
    const patterns = [];
    for (const cluster of clusters) {
      const pattern = analyzeCluster(cluster, opportunityId);
      if (pattern && pattern.transaction_count >= 2) {
        patterns.push(pattern);
      }
    }

    // Delete old patterns
    const oldPatterns = await base44.asServiceRole.entities.RecurringPattern.filter({
      opportunity_id: opportunityId
    });
    for (const old of oldPatterns) {
      await base44.asServiceRole.entities.RecurringPattern.delete(old.id);
    }

    // Create new patterns
    const createdPatterns = [];
    for (const pattern of patterns) {
      const created = await base44.asServiceRole.entities.RecurringPattern.create(pattern);
      createdPatterns.push(created);

      // Update transactions with pattern info
      for (const txId of pattern.transaction_ids || []) {
        const tx = transactions.find(t => t.id === txId);
        if (tx) {
          await base44.asServiceRole.entities.BankTransaction.update(txId, {
            is_recurring: true,
            recurring_group_id: created.id,
            category: pattern.category,
            is_mca: pattern.is_mca
          });
        }
      }
    }

    // Update analysis with pattern counts
    const analysis = await base44.asServiceRole.entities.FinancialAnalysis.filter({
      opportunity_id: opportunityId
    });
    if (analysis.length > 0) {
      const mcaTotal = patterns
        .filter(p => p.is_mca)
        .reduce((sum, p) => sum + p.total_amount, 0);

      await base44.asServiceRole.entities.FinancialAnalysis.update(analysis[0].id, {
        recurring_patterns_count: patterns.length,
        total_mca_payments: mcaTotal
      });
    }

    return Response.json({
      success: true,
      patterns_detected: patterns.length,
      mca_patterns: patterns.filter(p => p.is_mca).length
    });

  } catch (error) {
    console.error('Pattern detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function clusterTransactions(transactions) {
  const clusters = [];
  const used = new Set();

  for (let i = 0; i < transactions.length; i++) {
    if (used.has(i)) continue;

    const cluster = [transactions[i]];
    used.add(i);

    for (let j = i + 1; j < transactions.length; j++) {
      if (used.has(j)) continue;

      if (isSimilarDescription(transactions[i].description_clean, transactions[j].description_clean)) {
        cluster.push(transactions[j]);
        used.add(j);
      }
    }

    if (cluster.length >= 2) {
      clusters.push(cluster);
    }
  }

  return clusters;
}

function isSimilarDescription(desc1, desc2) {
  if (!desc1 || !desc2) return false;
  
  // Exact match
  if (desc1 === desc2) return true;

  // Calculate similarity score
  const words1 = desc1.split(' ').filter(w => w.length > 2);
  const words2 = desc2.split(' ').filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return false;

  let matches = 0;
  for (const word of words1) {
    if (words2.includes(word)) matches++;
  }

  const similarity = matches / Math.max(words1.length, words2.length);
  return similarity >= 0.6;
}

function analyzeCluster(cluster, opportunityId) {
  if (cluster.length < 2) return null;

  // Sort by date
  cluster.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

  const amounts = cluster.map(t => t.debit > 0 ? t.debit : t.credit);
  const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  const totalAmount = amounts.reduce((sum, a) => sum + a, 0);

  // Calculate standard deviation for anomaly detection
  const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  // Detect frequency
  const dates = cluster.map(t => new Date(t.transaction_date));
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    const days = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(days);
  }

  const avgInterval = intervals.length > 0 
    ? intervals.reduce((sum, i) => sum + i, 0) / intervals.length 
    : 0;

  let frequency = 'irregular';
  if (avgInterval <= 1.5) frequency = 'daily';
  else if (avgInterval >= 6 && avgInterval <= 8) frequency = 'weekly';
  else if (avgInterval >= 13 && avgInterval <= 16) frequency = 'biweekly';
  else if (avgInterval >= 28 && avgInterval <= 32) frequency = 'monthly';

  // Classify category and detect MCA
  const description = cluster[0].description_clean;
  const classification = classifyPattern(description, frequency, avgAmount);

  // Mark anomalies
  for (const tx of cluster) {
    const amount = tx.debit > 0 ? tx.debit : tx.credit;
    const deviation = Math.abs(amount - avgAmount);
    if (deviation > avgAmount * 0.1 && stdDev > 0) {
      tx.is_anomaly = true;
    }
  }

  return {
    opportunity_id: opportunityId,
    description_pattern: cluster[0].description,
    category: classification.category,
    frequency: frequency,
    avg_amount: avgAmount,
    min_amount: minAmount,
    max_amount: maxAmount,
    total_amount: totalAmount,
    transaction_count: cluster.length,
    first_occurrence: cluster[0].transaction_date,
    last_occurrence: cluster[cluster.length - 1].transaction_date,
    is_mca: classification.is_mca,
    confidence_score: classification.confidence,
    transaction_ids: cluster.map(t => t.id)
  };
}

function classifyPattern(description, frequency, avgAmount) {
  const desc = description.toLowerCase();

  // MCA/Lender detection (highest priority)
  const mcaKeywords = [
    'capital', 'funding', 'advance', 'merchant', 'mca', 'lender',
    'loan', 'payment', 'financing', 'bizfi', 'kabbage', 'ondeck',
    'fundbox', 'bluevine', 'forward', 'rapid', 'cash advance'
  ];

  let mcaScore = 0;
  for (const keyword of mcaKeywords) {
    if (desc.includes(keyword)) mcaScore += 30;
  }

  // Daily/weekday frequency is strong MCA indicator
  if (frequency === 'daily' && avgAmount > 100) mcaScore += 40;

  // Fixed amounts suggest MCA
  if (avgAmount > 200 && avgAmount < 5000) mcaScore += 10;

  if (mcaScore >= 50) {
    return { category: 'mca_lender', is_mca: true, confidence: Math.min(mcaScore, 95) };
  }

  // Other categories
  if (desc.includes('payroll') || desc.includes('salary') || desc.includes('wages')) {
    return { category: 'payroll', is_mca: false, confidence: 80 };
  }

  if (desc.includes('rent') || desc.includes('lease')) {
    return { category: 'rent_lease', is_mca: false, confidence: 75 };
  }

  if (desc.includes('utility') || desc.includes('electric') || desc.includes('gas') || desc.includes('water')) {
    return { category: 'utilities', is_mca: false, confidence: 75 };
  }

  if (desc.includes('transfer') || desc.includes('xfer')) {
    return { category: 'transfers', is_mca: false, confidence: 70 };
  }

  if (desc.includes('fee') || desc.includes('charge') || desc.includes('service')) {
    return { category: 'bank_fees', is_mca: false, confidence: 65 };
  }

  if (desc.includes('subscription') || desc.includes('monthly')) {
    return { category: 'subscriptions', is_mca: false, confidence: 60 };
  }

  return { category: 'other', is_mca: false, confidence: 40 };
}