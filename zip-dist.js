import AdmZip from 'adm-zip';

const zip = new AdmZip();
zip.addLocalFolder('./dist');
zip.writeZip('./dist.zip');
console.log('Successfully created dist.zip with standard Unix forward slashes');
