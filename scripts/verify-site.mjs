import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const html=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,item.name);if(item.isDirectory()&&!['.git','node_modules'].includes(item.name))walk(full);else if(item.isFile()&&item.name.endsWith('.html'))html.push(full)}}
walk(root);
const errors=[];
for(const file of html){const src=fs.readFileSync(file,'utf8');const rel=path.relative(root,file);for(const required of ['<title>','meta name="description"','meta name="viewport"'])if(!src.includes(required))errors.push(`${rel}: missing ${required}`);for(const match of src.matchAll(/href="([^"]+)"/g)){const href=match[1];if(!href.startsWith('/')||href.startsWith('//'))continue;if(href.startsWith('/assets/')){if(!fs.existsSync(path.join(root,href)))errors.push(`${rel}: missing ${href}`);continue}const clean=href.split('#')[0].split('?')[0];if(!clean)continue;const candidates=[path.join(root,`${clean}.html`),path.join(root,clean,'index.html'),clean==='/'?path.join(root,'index.html'):null].filter(Boolean);if(!candidates.some(fs.existsSync))errors.push(`${rel}: broken link ${href}`)}if(src.includes('<form')&&!src.includes('data-demo-form'))errors.push(`${rel}: form is not marked safe demo mode`);if(/<form[^>]+action=/.test(src))errors.push(`${rel}: demo form must not have an action`)}
for(const required of ['FIREWORKS-PROJECT.md','sitemap.xml','robots.txt','assets/storefront-preview.svg'])if(!fs.existsSync(path.join(root,required)))errors.push(`missing ${required}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`Verified ${html.length} HTML pages: links, metadata, demo-form safety, and FireWorks deliverables passed.`);
