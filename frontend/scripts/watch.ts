import chokidar from 'chokidar';
import { exec } from 'child_process';
import * as path from 'path';

const sourceFile = path.join(__dirname, '../messages/fr.json');
let isTranslating = false;
let timeoutId: NodeJS.Timeout | null = null;

console.log('\n👀 Surveillance du fichier fr.json...');
console.log('   Modifiez fr.json pour déclencher automatiquement la traduction\n');

const watcher = chokidar.watch(sourceFile, {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('change', () => {
  if (isTranslating) return;
  
  if (timeoutId) clearTimeout(timeoutId);
  
  timeoutId = setTimeout(() => {
    isTranslating = true;
    console.log('\n📝 Changement détecté, lancement de la traduction...');
    
    exec('npx tsx scripts/translate.ts', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
      } else {
        console.log(stdout);
        if (stderr) console.error(stderr);
      }
      isTranslating = false;
      timeoutId = null;
    });
  }, 1000);
});

console.log('✅ Surveillance active. Appuyez sur Ctrl+C pour arrêter.\n');

process.on('SIGINT', () => {
  console.log('\n👋 Arrêt de la surveillance...');
  watcher.close();
  process.exit(0);
});