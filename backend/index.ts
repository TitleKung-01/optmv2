import app from './src/app';
import { env } from './src/config/env';

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`🤖 POST /api/ai-breakdown`);
  console.log(`📅 POST /api/schedule`);
  console.log(`📋 /api/tasks (GET / POST / PUT / DELETE)`);
  console.log(`🔄 POST /api/tasks/spawn-recurring`);
});
