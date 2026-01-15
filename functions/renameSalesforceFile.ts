Deno.serve(async (req) => {
  try {
    const { contentDocumentId, newTitle, token, instanceUrl } = await req.json();

    if (!contentDocumentId || !newTitle || !token || !instanceUrl) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentDocument/${contentDocumentId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Title: newTitle })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return Response.json(
        { error: error.message || 'Failed to rename file' },
        { status: response.status }
      );
    }

    return Response.json({ success: true, message: 'File renamed successfully' });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});