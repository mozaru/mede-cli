function isEmpty(value: string | null | undefined): boolean
{
    return value === null || value === undefined || value.trim() === "";
}

function notIsEmpty(value: string | null | undefined): boolean
{
    return !isEmpty(value);
}


export {
    isEmpty,
    notIsEmpty,
}