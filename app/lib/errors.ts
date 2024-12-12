import { Prisma } from "@prisma/client";


export function prismaKnownErrorrs(error: Prisma.PrismaClientKnownRequestError) {
    let errorMessage: string = "failed to perform operation";
    let statusCode: number = 500;
    switch (error.code) {
        case 'P2002':
            errorMessage = "This Item already exists or email/reg_no already assigned.";
            statusCode = 409;
            break;
        case 'P2000':
            errorMessage = "The provided value for the column is too long.";
            statusCode = 400;
            break;
        case 'P2001':
            errorMessage = "The record to update does not exist.";
            statusCode = 404;
            break;
        case 'P2003':
            errorMessage = "Foreign key constraint failed.";
            statusCode = 400;
            break;
        case 'P2004':
            errorMessage = "A constraint failed on the database.";
            statusCode = 400;
            break;
        case 'P2005':
            errorMessage = "The value is invalid for the given field.";
            statusCode = 400;
            break;
        case 'P2006':
            errorMessage = "The provided value for the field is invalid.";
            statusCode = 400;
            break;
        case 'P2007':
            errorMessage = "Data validation error.";
            statusCode = 400;
            break;
        case 'P2008':
            errorMessage = "Failed to parse query.";
            statusCode = 400;
            break;
        case 'P2009':
            errorMessage = "Failed to validate query.";
            statusCode = 400;
            break;
        case 'P2010':
            errorMessage = "Raw query failed.";
            statusCode = 500;
            break;
        case 'P2011':
            errorMessage = "Null constraint violation.";
            statusCode = 400;
            break;
        case 'P2012':
            errorMessage = "Missing a required value.";
            statusCode = 400;
            break;
        case 'P2013':
            errorMessage = "Missing the required argument.";
            statusCode = 400;
            break;
        case 'P2014':
            errorMessage = "Relation violation.";
            statusCode = 400;
            break;
        case 'P2015':
            errorMessage = "A related record was not found.";
            statusCode = 404;
            break;
        case 'P2016':
            errorMessage = "Query interpretation error.";
            statusCode = 400;
            break;
        case 'P2017':
            errorMessage = "The records for relation are not connected.";
            statusCode = 400;
            break;
        case 'P2018':
            errorMessage = "The required connected records were not found.";
            statusCode = 400;
            break;
        case 'P2019':
            errorMessage = "Input error.";
            statusCode = 400;
            break;
        case 'P2020':
            errorMessage = "Value out of range for the type.";
            statusCode = 400;
            break;
        case 'P2021':
            errorMessage = "Table does not exist.";
            statusCode = 404;
            break;
        case 'P2022':
            errorMessage = "Column does not exist.";
            statusCode = 404;
            break;
        case 'P2023':
            errorMessage = "Inconsistent column data.";
            statusCode = 400;
            break;
        default:
            errorMessage = "A known error occurred.";
            break;
    }

    return [errorMessage, statusCode]

}