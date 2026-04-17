import * as crypto from 'crypto';

function calculateHashFromContent(content:string) : string
{
    if (!content) return "";
    
    return crypto
        .createHash('md5')
        .update(content)
        .digest('hex');
}

function calculateHashFromJson(content: any) : string
{
    if (!content) return "";    
    const jsonString = JSON.stringify(content);
    return calculateHashFromContent(jsonString);
}

export {
    calculateHashFromContent,
    calculateHashFromJson
}
