import { sql } from '@vercel/postgres';
import {
  CustomerField, CustomersTable, ImagesTable,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  ReviewsTable,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchReviewsCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const reviewsCountPromise = sql`SELECT COUNT(*) FROM reviews WHERE status IN ('published', 'pending')`;
    const authorsCountPromise = sql`SELECT COUNT(*) FROM customers`;

    const data = await Promise.all([
      reviewsCountPromise,
      authorsCountPromise,
    ]);

    const numberOfReviews = Number(data[0].rows[0].count ?? '0');
    const numberOfAuthors = Number(data[1].rows[0].count ?? '0');

    return {
      numberOfReviews,
      numberOfAuthors,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reviews card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));
    console.log(invoice);
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchReviewsPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM reviews
    JOIN customers ON reviews.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      reviews.created_at::text ILIKE ${`%${query}%`} OR
      reviews.updated_at::text ILIKE ${`%${query}%`} OR
      reviews.title ILIKE ${`%${query}%`} OR
      reviews.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of reviews.');
  }
}

export async function fetchFilteredReviews(
    query: string,
    currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const reviews = await sql<ReviewsTable>`
      SELECT
        reviews.id,
        reviews.customer_id,
        reviews.title,
        reviews.status,
        reviews.created_at,
        reviews.updated_at,
        customers.name AS author_name,
        customers.email,
        customers.image_url
      FROM reviews
      JOIN customers ON reviews.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        reviews.created_at::text ILIKE ${`%${query}%`} OR
        reviews.updated_at::text ILIKE ${`%${query}%`} OR
        reviews.title ILIKE ${`%${query}%`} OR
        reviews.status ILIKE ${`%${query}%`}
      ORDER BY reviews.updated_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return reviews.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reviews by filter.');
  }
}

export async function fetchReviewById(id: string) {
  try {
    const data = await sql<ReviewsTable>`
      SELECT
        reviews.id,
        reviews.customer_id,
        reviews.title,
        reviews.status,
        reviews.created_at,
        reviews.updated_at,
        reviews.text,
        customers.name AS author_name,
        customers.email,
        customers.image_url
      FROM reviews
      JOIN customers ON reviews.customer_id = customers.id
      WHERE reviews.id = ${id};
    `;

    const review = data.rows.map((review) => ({
      ...review,
      // Convert amount from cents to dollars
      // amount: invoice.amount / 100,
    }));
    console.log(review);
    return review[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch review by id.');
  }
}

const IMAGES_LIMIT = 1000;

export async function fetchImages(
    document_id: string,
    document_type: string,
) {

  try {
    const images = await sql<ImagesTable>`
      SELECT
        images.id,
        images.document_type,
        images.url
      FROM images
      WHERE
        images.document_id = ${document_id} AND
        images.document_type = ${document_type}
      ORDER BY images.id DESC
      LIMIT ${IMAGES_LIMIT}
    `;
    return images.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch images.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTable>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(reviews.id) AS total_published_reviews
		FROM customers
		LEFT JOIN reviews ON customers.id = reviews.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
          customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch reviews authors (customers) table.');
  }
}
