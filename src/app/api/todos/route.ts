// Next.js API route for /api/todos. This file defines RESTful handlers for todo CRUD operations using Prisma.
// Each exported function (GET, POST, PUT, DELETE, PATCH) maps to the corresponding HTTP method.
// This file runs on the server (Edge or Node.js) and can access your database securely.

import { NextResponse } from 'next/server';
import { API_ERROR_CODES, ApiResponse, createApiError, createApiResponse } from '@/types/api';
import { Todo, QuadrantKey } from '@/types/todo';
import { prisma } from '@/lib/prisma';

// Type for Prisma's raw todo data before transformation
type PrismaTodo = any;

/**
 * Transforms a Prisma todo object into the expected API response format.
 * Converts Date objects to ISO strings for JSON serialization.
 */
function transformPrismaTodo(todo: PrismaTodo) {
  return {
    ...todo,
    createdAt: todo.createdAt.toISOString(),
    dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
    completedAt: todo.completedAt ? todo.completedAt.toISOString() : null,
  };
}

/**
 * Creates a standardized JSON response with proper headers and status code.
 * Used by all API endpoints to maintain consistent response format.
 */
function jsonResponse<T>(data: ApiResponse<T>, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * GET /api/todos
 * Retrieves all todos, ordered by creation date (newest first).
 * Returns a standardized API response with transformed todo data.
 */
export async function GET(): Promise<NextResponse<ApiResponse<Todo[]>>> {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jsonResponse(createApiResponse(todos.map(transformPrismaTodo)));
  } catch (error) {
    console.error('Error fetching todos:', error);
    return jsonResponse(
      createApiError(API_ERROR_CODES.DATABASE_ERROR, 'Failed to fetch todos', error),
      500
    );
  }
}

/**
 * POST /api/todos
 * Creates a new todo with the provided text and optional due date.
 * Sets completed to false by default.
 * Returns the created todo with transformed dates.
 */
export async function POST(request: Request): Promise<NextResponse<ApiResponse<Todo>>> {
  try {
    const body = await request.json();
    const todo = await prisma.todo.create({
      data: {
        text: body.text,
        quadrant: body.quadrant,
        completed: body.completed ?? false,
        isWaiting: body.isWaiting ?? false,
        order: body.order,
        createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        note: body.note ?? null,
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        deleted: body.deleted ?? null,
      },
    });
    return jsonResponse(transformPrismaTodo(todo));
  } catch (error) {
    console.error('Error creating todo:', error);
    return jsonResponse(
      createApiError(API_ERROR_CODES.DATABASE_ERROR, 'Failed to create todo', error),
      500
    );
  }
}

/**
 * PUT /api/todos
 * Updates an existing todo with the provided fields.
 * Handles text updates, completion status, and due date changes.
 * When marking as completed, sets completedAt to current timestamp.
 * Returns the updated todo with transformed dates.
 */
export async function PUT(request: Request): Promise<NextResponse<ApiResponse<Todo>>> {
  try {
    const body = await request.json();
    const updateData: any = {};

    // Handle all possible fields
    if (body.text !== undefined) updateData.text = body.text;
    if (body.completed !== undefined) {
      updateData.completed = body.completed;
      // Always set completedAt based on completed status
      if (body.completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (body.isWaiting !== undefined) updateData.isWaiting = body.isWaiting;
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }
    if (body.note !== undefined) updateData.note = body.note;
    if (body.quadrant !== undefined) updateData.quadrant = body.quadrant;
    if (body.deleted !== undefined) updateData.deleted = body.deleted;
    if (body.order !== undefined) updateData.order = body.order;

    const todo = await prisma.todo.update({
      where: { id: body.id },
      data: updateData,
    });

    return jsonResponse(transformPrismaTodo(todo));
  } catch (error) {
    console.error('Error updating todo:', error);
    return jsonResponse(
      createApiError(API_ERROR_CODES.DATABASE_ERROR, 'Failed to update todo', error),
      500
    );
  }
}

/**
 * DELETE /api/todos
 * Deletes a todo by its ID, which must be provided as a query parameter.
 * Returns an empty response on success.
 */
export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return jsonResponse(
        createApiError(API_ERROR_CODES.VALIDATION_ERROR, 'Todo ID is required'),
        400
      );
    }
    await prisma.todo.delete({
      where: { id },
    });
    return jsonResponse(createApiResponse(undefined));
  } catch (error) {
    console.error('Error deleting todo:', error);
    return jsonResponse(
      createApiError(API_ERROR_CODES.DATABASE_ERROR, 'Failed to delete todo', error),
      500
    );
  }
}

/**
 * Interface for bulk todo updates.
 * Used in the PATCH endpoint for reordering and batch updates.
 */
interface TodoUpdate {
  id: string;
  order: number;
  completedAt: string | null;
}

/**
 * PATCH /api/todos
 * Updates multiple todos in a single request.
 * Primarily used for reordering todos and batch completion status updates.
 * Takes an array of updates, each containing a todo ID and new order/status.
 * Returns all updated todos with transformed dates.
 */
export async function PATCH(request: Request): Promise<NextResponse<ApiResponse<Todo[]>>> {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!Array.isArray(data.updates)) {
      return jsonResponse(
        createApiError(API_ERROR_CODES.VALIDATION_ERROR, 'Updates must be an array'),
        400
      );
    }

    const updatedTodos = await Promise.all(
      data.updates.map(async (update: TodoUpdate) => {
        if (!update.id) {
          throw new Error('Missing todo ID in update');
        }
        return prisma.todo.update({
          where: { id: update.id },
          data: {
            order: update.order,
            completedAt: update.completedAt ? new Date(update.completedAt) : null,
          },
        });
      })
    );
    return jsonResponse(createApiResponse(updatedTodos.map(transformPrismaTodo)));
  } catch (error) {
    console.error('Error updating todos:', error);
    return jsonResponse(
      createApiError(API_ERROR_CODES.DATABASE_ERROR, 'Failed to update todos', error),
      500
    );
  }
} 