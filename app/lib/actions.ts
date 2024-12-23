'use server';  // i.e. mark all exported functions as Server Actions

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {QueryResult, QueryResultRow, sql} from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import mime from 'mime';
import sharp from "sharp";
import { join } from 'path';
import { stat, writeFile } from 'fs/promises';

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Incorrect email or password';
                default:
                    return 'Unexpected auth error.';
            }
        }
        throw error;
    }
}

const InvoiceFormSchema = z.object({
    id: z.string(),
    customerId: z.string({ invalid_type_error: 'Please select a customer.' }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {invalid_type_error: 'Please select an invoice status.'}),
    date: z.string(),
});

const CreateInvoice = InvoiceFormSchema.omit({id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

// prevState - contains the state passed from the useActionState hook.
export async function createInvoice(prevState: State, formData: FormData) {

    // Validate form fields using Zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insert data into the database
    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        return {message: 'Database Error: Failed to create Invoice.', error};
    }

    revalidatePath('/dashboard/invoices');  // invalidate browser client cache once database is updated
    redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId},
                amount      = ${amountInCents},
                status      = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        return {message: 'Database Error: Failed to update Invoice.', error};
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');  // redirect returns an error internally, it must be called outside the try / catch block.
}

export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE
                  FROM invoices
                  WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return {message: 'Invoice has been deleted.'};
    } catch (error) {
        return {message: 'Database Error: Failed to delete Invoice.', error};
    }
}

// Actions with Reviews

const ReviewCreateFormSchema = z.object({
    id: z.string(),
    customerId: z.string({ invalid_type_error: 'Please select an author.' }),
    title: z.string({ invalid_type_error: 'Please select enter a title.' }),
    status: z.enum(['pending', 'published', 'archived'], {invalid_type_error: 'Please select a valid review status.'}),
    created_at: z.string(),
    updated_at: z.string(),
    image: z.string(),
    //nextPartId: z.string(),
    text: z.string(),
});

const CreateReview = ReviewCreateFormSchema.omit({id: true, created_at: true, updated_at: true});

export type CreateReviewState = {
    errors?: {
        customerId?: string[];
        title?: string[];
        status?: string[];
    };
    message?: string | null;
}

interface ReviewDBRow extends QueryResultRow {
    id: string;
}

// prevState - contains the state passed from the useActionState hook.
export async function createReview(prevState: CreateReviewState, formData: FormData) {

    const imageFiles = formData.get('images') as File;
    const imageURL = await saveFile(imageFiles);

    // Validate form fields using Zod
    const validatedFields = CreateReview.safeParse({
        customerId: formData.get('customerId'),
        title: formData.get('title'),
        status: formData.get('status'),
        image: imageURL,
        // nextPartId: formData.get('nextPartId'),
        text: formData.get('text'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create a Review.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, title, status, image, text } = validatedFields.data;
    const nextPartId = "4f758f9c-721f-4e4e-9715-eaa6655cbee3"  // UUID of an existing review
    const createdAt = new Date().toISOString().split('T')[0];
    const updatedAt = new Date().toISOString().split('T')[0];

    try {
        // Insert data into the 'reviews' database
        const result: QueryResult<ReviewDBRow> = await sql`
            INSERT INTO reviews (customer_id, title, status, created_at, updated_at, next_part_id, text)
            VALUES (${customerId}, ${title}, ${status}, ${createdAt}, ${updatedAt}, ${nextPartId}, ${text})
            RETURNING id
        `;
        // and into the 'images' table
        await sql`
            INSERT INTO images (document_id, document_type, url)
            VALUES (${result.rows[0].id}::uuid, 'review', ${image})
        `;
    } catch (error) {
        console.log(error);
        return {message: 'Database Error: Failed to create a Review: ' + error};
    }

    revalidatePath('/dashboard/reviews');  // invalidate browser client cache once database is updated
    redirect('/dashboard/reviews');
}

// Use Zod to update the expected types
const ReviewUpdateFormSchema = z.object({
    id: z.string(),
    customerId: z.string({ invalid_type_error: 'Please select an author.' }),
    title: z.string({ invalid_type_error: 'Please select enter a title.' }),
    status: z.enum(['pending', 'published', 'archived'], {invalid_type_error: 'Please select a valid review status.'}),
    // image: z.string(),
    // nextPartId: z.string(),
    text: z.string(),
});

const UpdateReview = ReviewUpdateFormSchema.omit({ id: true });

export async function updateReview(id: string, formData: FormData) {

    // Validate form fields using Zod
    const { customerId, title, status, text } = UpdateReview.parse({
        customerId: formData.get('customerId'),
        title: formData.get('title'),
        status: formData.get('status'),
        // image: formData.get('images'),
        // nextPartId: formData.get('nextPartId'),
        text: formData.get('text'),
    });
    const updatedAt = new Date().toISOString().split('T')[0];

    try {
        await sql`
            UPDATE reviews
            SET customer_id = ${customerId},
                title       = ${title},
                status      = ${status},
                text        = ${text},
                updated_at  = ${updatedAt}
            WHERE id = ${id}
        `;
    } catch (error) {
        return {message: 'Database Error: Failed to update Review.', error};
    }

    revalidatePath('/dashboard/reviews');
    redirect('/dashboard/reviews');  // redirect returns an error internally, it must be called outside the try / catch block.
}

async function saveFile(file: File) {
    let buffer = Buffer.from(await file.arrayBuffer());
    // Zoom-able images must be in .png format
    console.log(file.type);
    if (file.type != 'image/png') {
        buffer = await sharp(buffer).png().toBuffer();
    }

    const imagesDir = join(process.cwd(), '/public', 'photos');
    try {
        await stat(imagesDir);
    } catch (e: any) {
        if (e.code == "ENOENT") {
            console.error("failed to upload images, directory does not exist")
        } else {
            console.error("failed to upload images, internal server error: ", e)
        }
    }

    const filename = `${uuidv4()}.${mime.getExtension(file.type)}`;
    try {
        await writeFile(`${imagesDir}/${filename}`, buffer);
    } catch (e) {
        console.error("failed to write image file: ", e)
    }
    return join('/photos', filename);
}

export async function deleteReview(id: string) {
    try {
        await sql`DELETE
                  FROM reviews
                  WHERE id = ${id}`;
        revalidatePath('/dashboard/reviews');
        return {message: 'Review has been deleted.'};
    } catch (error) {
        return {message: 'Database Error: Failed to delete Review.', error};
    }
}