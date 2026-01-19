Deno.serve(async (req) => {
  try {
    const { objectType, recordId, token, instanceUrl } = await req.json();

    console.log('Deleting record:', { objectType, recordId });

    const response = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/${objectType}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Delete response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      console.error('Salesforce delete error:', errorData);
      return Response.json({ 
        error: 'Failed to delete record',
        details: errorData
      }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});