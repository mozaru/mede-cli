function strToJson(content:string) : any
{
    try {
        return JSON.parse(content);
    } catch (error) {
        console.error("Erro ao converter string para JSON:", error);
        return null;
    }
}

function jsonToStr(content: any) : string
{
    try {
        return JSON.stringify(content, null, 2);
    } catch (error) {
        console.error("Erro ao converter JSON para string:", error);
        return "";
    }
}

export {
    strToJson,
    jsonToStr
}
