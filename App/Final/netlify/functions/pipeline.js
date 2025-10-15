export async function handler(event, context) {

  const apiUrl = Netlify.env.get("EC2_API_PUBLIC_IPv4");

  try {
    const response = await fetch(`${apiUrl}/pipeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
}
