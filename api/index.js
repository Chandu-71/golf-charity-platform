const express = require('express');
const cors = require('cors');
const supabase = require('../backend/supabaseClient');
const Razorpay = require('razorpay');

const app = express();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/charities', async (req, res) => {
  try {
    const { data, error } = await supabase.from('charities').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, plan, charity_percentage, scores(id, score, date)')
      .order('id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    return res.json(profiles ?? []);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/api/draws', async (req, res) => {
  try {
    const { data, error } = await supabase.from('draws').select('*');
    if (error) return res.status(400).json({ error: error.message, details: error.hint });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/admin/draws/run', async (req, res) => {
  try {
    const numbers = new Set();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const winningNumbers = Array.from(numbers).sort((a, b) => a - b);

    const { data, error } = await supabase
      .from('draws')
      .insert({
        month_year: new Date().toISOString().slice(0, 10),
        winning_numbers: winningNumbers,
        status: 'published',
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 100000,
      currency: 'INR',
      receipt: 'receipt_1',
    });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

module.exports = app;
