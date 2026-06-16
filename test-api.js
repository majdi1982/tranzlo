fetch('http://localhost:3000/api/blog/generate', {
  method: 'POST',
  body: JSON.stringify({
    competitorUrl: 'https://en.wikipedia.org/wiki/Translation',
    category: 'general'
  }),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test'
  }
}).then(res => res.json().then(data => console.log(res.status, data))).catch(err => console.log(err));
