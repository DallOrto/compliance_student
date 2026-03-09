import 'dotenv/config';
import express from 'express';
import studentRoutes from './modules/student/routes/student.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/students', studentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'compliance_student API running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
