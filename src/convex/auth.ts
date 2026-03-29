import { AuthKit } from '@convex-dev/workos-authkit';
import { components } from './_generated/api';
import type { DataModel } from './_generated/dataModel';

type WorkOSComponentApi = ConstructorParameters<typeof AuthKit<DataModel>>[0];

const workOSComponent = (components as Record<'workOSAuthKit', WorkOSComponentApi>).workOSAuthKit;

export const authKit = new AuthKit<DataModel>(workOSComponent);
