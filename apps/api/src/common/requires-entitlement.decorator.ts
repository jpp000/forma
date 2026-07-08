import { SetMetadata } from '@nestjs/common';

export const ENTITLEMENT_KEY = 'entitlement';

export const RequiresEntitlement = (feature: string) =>
  SetMetadata(ENTITLEMENT_KEY, feature);
