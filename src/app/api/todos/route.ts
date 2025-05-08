// Next.js API route for /api/todos. This file defines RESTful handlers for todo CRUD operations using Prisma.
// Each exported function (GET, POST, PUT, DELETE, PATCH) maps to the corresponding HTTP method.
// This file runs on the server (Edge or Node.js) and can access your database securely.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Debug helper: Log the database URL for every request (useful for troubleshooting environment issues)
function logDatabaseUrl() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
}

// GET /api/todos - List all todos, ordered by 'order' field
export async function GET() {
  logDatabaseUrl();
  const todos = await prisma.todo.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(todos);
}

// POST /api/todos - Create a new todo
export async function POST(request: Request) {
  logDatabaseUrl();
  try {
    const data = await request.json();
    // Find the max order in the target quadrant to place the new todo at the end
    const maxOrderTodo = await prisma.todo.findFirst({
      where: { quadrant: data.quadrant || 'inbox' },
      orderBy: { order: 'desc' },
    });
    const nextOrder = maxOrderTodo ? maxOrderTodo.order + 1 : 0;
    // Create the new todo in the database
    const todo = await prisma.todo.create({
      data: {
        text: data.text,
        quadrant: data.quadrant || 'inbox',
        completed: false,
        isWaiting: false,
        createdAt: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        note: data.note,
        deleted: false,
        order: nextOrder,
      },
    });
    return NextResponse.json(todo);
  } catch (error) {
    // Handle errors and return a 500 response
    const message = error instanceof Error ? error.message : String(error);
    console.error('POST /api/todos error:', error);
    return NextResponse.json({ error: message || 'Unknown error' }, { status: 500 });
  }
}

// PUT /api/todos - Update an existing todo
export async function PUT(request: Request) {
  logDatabaseUrl();
  const data = await request.json();
  // Update the todo by id
  const todo = await prisma.todo.update({
    where: { id: data.id },
    data: {
      text: data.text,
      quadrant: data.quadrant,
      completed: data.completed,
      isWaiting: data.isWaiting,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      note: data.note,
      deleted: data.deleted,
    },
  });
  return NextResponse.json(todo);
}

// DELETE /api/todos - Delete a todo by id
export async function DELETE(request: Request) {
  logDatabaseUrl();
  const data = await request.json();
  await prisma.todo.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}

// PATCH /api/todos - Bulk update the order of multiple todos
export async function PATCH(request: Request) {
  logDatabaseUrl();
  try {
    const data = await request.json(); // expects { updates: [{ id, order }, ...] }
    const updates = data.updates;
    // Update each todo's order in parallel
    const updatePromises = updates.map((u: { id: string, order: number }) =>
      prisma.todo.update({ where: { id: u.id }, data: { order: u.order } })
    );
    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('PATCH /api/todos error:', error);
    return NextResponse.json({ error: message || 'Unknown error' }, { status: 500 });
  }
} 