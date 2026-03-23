export type BookingDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export type BookingAvailability = 'available' | 'busy' | 'unknown' | undefined;

export interface IBookingResource {
  id: string;
  name: string;
  category: string | undefined;
  site: string | undefined;
  bookingUrl: string | undefined;
  availability: BookingAvailability;
  rules: string | undefined;
  featured: boolean;
  priority: number | undefined;
}

export interface IQuickBookingWebPartProps {
  dataSourceType: BookingDataSourceType;
  listTitleOrUrl: string;
  showAvailability: boolean;
  defaultCategory: string;
  resourcesJson: string;
  openInNewTab: boolean;
}

export interface IQuickBookingContext {
  webUrl: string;
}

export interface IQuickBookingControllerState {
  status: 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
  resources: IBookingResource[];
  categories: string[];
  sites: string[];
  selectedCategory: string;
  selectedSite: string;
  errorMessage: string | undefined;
  hasPartialData: boolean;
}

export interface IQuickBookingViewModel extends IQuickBookingControllerState {
  visibleResources: IBookingResource[];
}
