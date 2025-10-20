// ✅ OPTIMIZED: Cursor-based pagination for better performance with large datasets

import { Document, Model, FilterQuery } from 'mongoose';

export interface CursorPaginationParams {
  cursor?: string; // Base64 encoded cursor
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    totalCount?: number;
  };
}

/**
 * Cursor-based pagination helper
 * More efficient than offset pagination for large datasets
 * 
 * @param model - Mongoose model
 * @param filter - Query filter
 * @param params - Pagination parameters
 * @returns Paginated results with cursor info
 */
export async function cursorPaginate<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  params: CursorPaginationParams = {}
): Promise<CursorPaginationResult<T>> {
  const {
    cursor,
    limit = 25,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = params;

  // Decode cursor if provided
  let cursorData: { id: string; value: unknown } | null = null;
  if (cursor) {
    try {
      cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch (error) {
      console.error('Invalid cursor:', error);
      cursorData = null;
    }
  }

  // Build query with cursor
  const query: FilterQuery<T> = { ...filter };
  
  if (cursorData) {
    // Add cursor condition for efficient pagination
    const operator = sortOrder === 'desc' ? '$lt' : '$gt';
    (query as Record<string, unknown>)[sortField] = { [operator]: cursorData.value };
  }

  // Fetch one extra item to determine if there's a next page
  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const items = await model
    .find(query)
    .sort({ [sortField]: sortDirection, _id: sortDirection })
    .limit(limit + 1)
    .lean<T[]>()
    .exec();

  // Check if there's a next page
  const hasNextPage = items.length > limit;
  if (hasNextPage) {
    items.pop(); // Remove the extra item
  }

  // Generate cursors
  const startCursor = items.length > 0
    ? encodeCursor(
        String((items[0] as Document & { _id: unknown })._id), 
        (items[0] as Record<string, unknown>)[sortField]
      )
    : null;
  
  const endCursor = items.length > 0
    ? encodeCursor(
        String((items[items.length - 1] as Document & { _id: unknown })._id), 
        (items[items.length - 1] as Record<string, unknown>)[sortField]
      )
    : null;

  // Check if there's a previous page (only if cursor was provided)
  const hasPreviousPage = !!cursor;

  return {
    data: items,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
    },
  };
}

/**
 * Encode cursor for pagination
 */
function encodeCursor(id: string, value: unknown): string {
  const cursorData = { id, value };
  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
}

/**
 * Get total count (optional, can be expensive for large collections)
 * Use sparingly or cache the result
 */
export async function getTotalCount<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {}
): Promise<number> {
  return model.countDocuments(filter).exec();
}

/**
 * Cursor pagination with total count
 * Note: Getting total count can be slow for large collections
 * Consider caching or removing if not needed
 */
export async function cursorPaginateWithCount<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  params: CursorPaginationParams = {}
): Promise<CursorPaginationResult<T>> {
  const [result, totalCount] = await Promise.all([
    cursorPaginate(model, filter, params),
    getTotalCount(model, filter),
  ]);

  return {
    ...result,
    pageInfo: {
      ...result.pageInfo,
      totalCount,
    },
  };
}
