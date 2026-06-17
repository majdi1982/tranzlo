fetch('http://localhost:3000/api/blog/generate', {
  method: 'POST',
  body: JSON.stringify({
    competitorUrl: 'https://jurtrans.com/feed/',
    category: 'general'
  }),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test'
  }
}).then(res => res.text().then(text => console.log(res.status, text))).catch(err => console.log(err));
