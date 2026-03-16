import 'dotenv/config';
import express from 'express';
import studentRoutes from './modules/student/routes/student.routes';
import authRoutes from './modules/auth/routes/auth.routes';
import { setupSwagger } from './swagger';

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

setupSwagger(app);

app.use('/auth', authRoutes);
app.use('/students', studentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'compliance_student API running!' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
