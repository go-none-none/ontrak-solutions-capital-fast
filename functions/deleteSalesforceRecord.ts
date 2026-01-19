Deno.serve(async (req) => {
  try {
    const { objectType, recordId, token, instanceUrl } = await req.json();

    const response = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/${objectType}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Salesforce delete error:', errorData);
      return Response.json({ 
        error: 'Failed to delete record',
        details: errorData
      }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});