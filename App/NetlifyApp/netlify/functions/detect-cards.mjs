export default async function(event, context) {

  const apiUrl = Netlify.env.get("EC2_API_PUBLIC_IPv4");

  try {
    const response = await fetch(`${apiUrl}/detect-cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body,
      duplex: 'half'
    });

    const data = await response.json();

    // Return a Response object
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server Error"}), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
