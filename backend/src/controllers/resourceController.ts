import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { io } from '../index';

// Get list of all hospital equipment/resources
export const getAllResources = async (req: AuthRequest, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching resources' });
  }
};

// Update details, quantities, or statuses of resources (Admin & Nurses)
export const updateResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status, location, quantity, description } = req.body;

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        status: status !== undefined ? status : undefined,
        location: location !== undefined ? location : undefined,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        description: description !== undefined ? description : undefined
      }
    });

    // Broadcast live update
    io.emit('resource_updated', updated);

    res.json({
      message: 'Resource updated successfully',
      resource: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating resource' });
  }
};

// Create a new Resource inventory item (Admin only)
export const createResource = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, status, location, quantity, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Resource name and type are required' });
    }

    const existing = await prisma.resource.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Resource with this name already exists' });
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        status: status || 'AVAILABLE',
        location,
        quantity: quantity ? parseInt(quantity) : 1,
        description
      }
    });

    io.emit('resource_updated', resource);

    res.status(201).json({
      message: 'Resource added to inventory successfully',
      resource
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating resource' });
  }
};
