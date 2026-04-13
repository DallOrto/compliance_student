import cron from 'node-cron';
import axios from 'axios';
import prisma from '../lib/prisma';
import { ComplianceJobRepository } from '../modules/student/repositories/ComplianceJobRepository';
import { ComplianceRepository } from '../modules/student/repositories/ComplianceRepository';

const complianceJobRepository = new ComplianceJobRepository(prisma);
const complianceRepository = new ComplianceRepository(prisma);

// Executa a cada minuto
// Em produção seria a cada X minutos, mas 1 minuto facilita testes/dev
export function startComplianceWorker(): void {
  cron.schedule('* * * * *', async () => {
    console.log('[Worker] Verificando jobs de compliance pendentes...');

    const pendingJobs = await complianceJobRepository.findPendingOlderThan(30);

    if (pendingJobs.length === 0) {
      console.log('[Worker] Nenhum job pendente.');
      return;
    }

    console.log(`[Worker] ${pendingJobs.length} job(s) para processar.`);

    for (const job of pendingJobs) {
      try {
        // Lógica de aprovação/reprovação (simulada)
        const approved = Math.random() < 1 / 3;
        const reason = approved
          ? null
          : (['Documentação inválida', 'Critério de idade não atendido', 'Histórico escolar insuficiente'] as const)[
              Math.floor(Math.random() * 3)
            ];

        // Persiste o resultado no banco
        const complianceCheck = await complianceRepository.create({
          studentId: job.studentId,
          approved,
          reason,
        });

        // Avisa a API 1 via webhook
        await axios.post(
          job.callbackUrl,
          {
            jobId: job.id,
            complianceId: complianceCheck.id,
            approved,
            reason,
            complianceStudentId: job.studentId,
          },
          {
            headers: { 'x-api-key': process.env.INTERNAL_API_KEY },
            timeout: 10000,
          },
        );

        // Marca o job como concluído
        await complianceJobRepository.markDone(job.id);

        console.log(`[Worker] Job ${job.id} processado — approved: ${approved}`);
      } catch (err) {
        console.error(`[Worker] Erro ao processar job ${job.id}:`, err);
        // Não marca como DONE — será reprocessado na próxima rodada
      }
    }
  });

  console.log('[Worker] Compliance worker iniciado (roda a cada minuto).');
}
