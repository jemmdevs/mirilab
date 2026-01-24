// Portfolio project data structure
export interface PortfolioProject {
  id: string;
  name: string;
  title: string;
  desc1: string;
  desc2: string;
  imageSrc: string;
  bgId: string;
  layout: ProjectLayout;
}

// Layout configuration for positioning classes
export interface ProjectLayout {
  textPos: 'text-pos-1' | 'text-pos-2';
  titlePos: 'TitlePos-left' | 'TitlePos-right' | 'TitlePos-top' | 'TitlePos-bottom';
  desc1Pos: 'desc1Pos-top' | 'desc1Pos-right' | 'desc1Pos-left' | 'desc1Pos-bottom';
  desc2Pos: 'desc2Pos-top' | 'desc2Pos-right' | 'desc2Pos-left' | 'desc2Pos-bottom';
  imagePos: 'pos-top' | 'pos-right' | 'pos-left' | 'pos-bottom';
  imageDir: 'top' | 'right' | 'left' | 'bottom';
}

// Background image data
export interface BackgroundImage {
  id: string;
  src: string;
}

// Work item for navigation
export interface WorkItem {
  id: string;
  name: string;
}

// Content data for lazy loading
export interface ContentData {
  id: string;
  bg: string;
  images: string[];
}
