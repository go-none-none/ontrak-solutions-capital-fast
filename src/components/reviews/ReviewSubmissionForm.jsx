import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function ReviewSubmissionForm() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    location: '',
    fundingAmount: '',
    review: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating');
      return;
    }

    setSubmitting(true);

    try {
      await base44.entities.Review.create({
        name: formData.name,
        business: formData.business,
        location: formData.location,
        funding_amount: formData.fundingAmount,
        rating: rating,
        review: formData.review,
        approved: true
      });

      setSubmitted(true);
      setFormData({ name: '', business: '', location: '', fundingAmount: '', review: '' });
      setRating(0);
      
      // Reload page after 2 seconds to show new review
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      alert('There was an error submitting your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 rounded-2xl p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
        <p className="text-slate-600 mb-4">
          Your review has been submitted and will be reviewed by our team.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="border-[#08708E] text-[#08708E] hover:bg-[#08708E]/5"
        >
          Submit Another Review
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How would you rate your experience? *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Name *
          </label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
            className="h-12"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Business Name *
          </label>
          <Input
            required
            value={formData.business}
            onChange={(e) => setFormData({ ...formData, business: e.target.value })}
            placeholder="Smith Construction"
            className="h-12"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Location *
          </label>
          <Input
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Dallas, TX"
            className="h-12"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Funding Amount (Optional)
          </label>
          <Input
            value={formData.fundingAmount}
            onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
            placeholder="$50,000"
            className="h-12"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Review *
        </label>
        <Textarea
          required
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          placeholder="Tell us about your experience with OnTrak..."
          className="min-h-32"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#08708E] hover:bg-[#065a72] text-white h-14 text-lg font-semibold"
      >
        {submitting ? (
          'Submitting...'
        ) : (
          <>
            Submit Review
            <Send className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}