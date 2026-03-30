import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Configuration
const SOURCE_LANG = 'fr';
const TARGET_LANGS = ['en'];
const MESSAGES_DIR = path.join(__dirname, '../messages');

// Fonction pour utiliser Google Translate (gratuit)
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  if (text.trim() === '') return text;
  
  // Ne pas traduire les variables
  if (text.includes('{{') && text.includes('}}')) {
    return text;
  }
  
  const encodedText = encodeURIComponent(text);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodedText}`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const translated = parsed[0].map((item: any[]) => item[0]).join('');
          resolve(translated);
        } catch (e) {
          console.error(`Erreur traduction: ${text.substring(0, 50)}...`);
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

// Traduire un objet récursivement
async function translateObject(obj: Record<string, any>, targetLang: string): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = await translateText(value, targetLang);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Fonction principale
async function autoTranslate() {
  try {
    console.log('\n🚀 Début de la traduction automatique...\n');
    
    // Lire le fichier source
    const sourceFile = path.join(MESSAGES_DIR, `${SOURCE_LANG}.json`);
    if (!fs.existsSync(sourceFile)) {
      console.error(`❌ Fichier source ${sourceFile} introuvable`);
      process.exit(1);
    }
    
    const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
    console.log(`📖 Fichier source: ${SOURCE_LANG}.json`);
    console.log(`📊 Nombre de clés: ${Object.keys(sourceContent).length}\n`);
    
    // Traduire vers chaque langue cible
    for (const targetLang of TARGET_LANGS) {
      console.log(`📝 Traduction vers ${targetLang.toUpperCase()}...`);
      const translated = await translateObject(sourceContent, targetLang);
      
      // Écrire le fichier traduit
      const targetFile = path.join(MESSAGES_DIR, `${targetLang}.json`);
      fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2));
      console.log(`✅ Fichier ${targetLang}.json créé avec succès\n`);
    }
    
    console.log('🎉 Traduction terminée !\n');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter
autoTranslate();