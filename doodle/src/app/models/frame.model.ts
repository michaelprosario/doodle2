export interface SVGElement {
  type: string;
  properties: Record<string, any>;
}

export interface Frame {
  id: string;
  sceneId: string;
  order: number;
  elements: SVGElement[];  // to be expanded in Epic 3
  thumbnail?: string;
}
