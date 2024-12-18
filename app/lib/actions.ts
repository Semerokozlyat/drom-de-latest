'use server';  // i.e. mark all exported functions as Server Actions

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

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
        return {message: 'Database Error: Failed to create Invoice.'};
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
        return {message: 'Database Error: Failed to update Invoice.'};
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
        return {message: 'Database Error: Failed to delete Invoice.'};
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

// prevState - contains the state passed from the useActionState hook.
export async function createReview(prevState: CreateReviewState, formData: FormData) {

    // Validate form fields using Zod
    const validatedFields = CreateReview.safeParse({
        customerId: formData.get('customerId'),
        title: formData.get('title'),
        status: formData.get('status'),
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
    const { customerId, title, status, text } = validatedFields.data;
    const nextPartId = "4f758f9c-721f-4e4e-9715-eaa6655cbee3"  // UUID of an existing review
    const createdAt = new Date().toISOString().split('T')[0];
    const updatedAt = new Date().toISOString().split('T')[0];

    // Insert data into the 'reviews' database
    try {
        await sql`
            INSERT INTO reviews (customer_id, title, status, created_at, updated_at, next_part_id, text)
            VALUES (${customerId}, ${title}, ${status}, ${createdAt}, ${updatedAt}, ${nextPartId}, ${text})
        `;
    } catch (error) {
        return {message: 'Database Error: Failed to create a Review: ' + error.message};
    }

    revalidatePath('/dashboard/reviews');  // invalidate browser client cache once database is updated
    redirect('/dashboard/reviews');
}

export async function deleteReview(id: string) {
    try {
        await sql`DELETE
                  FROM reviews
                  WHERE id = ${id}`;
        revalidatePath('/dashboard/reviews');
        return {message: 'Review has been deleted.'};
    } catch (error) {
        return {message: 'Database Error: Failed to delete Review.'};
    }
}