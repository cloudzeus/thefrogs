"use server";
// location.ts — presence model removed; stubs kept for any remaining imports
export async function getLocations() { return []; }
export async function getPublicLocations() { return []; }
export async function getLocation(_id: string) { return null; }
export async function createLocation(_data: any) { throw new Error("Not implemented"); }
export async function updateLocation(_id: string, _data: any) { throw new Error("Not implemented"); }
export async function deleteLocation(_id: string) { throw new Error("Not implemented"); }
export async function getCoordinates(_query: string) { return null; }
