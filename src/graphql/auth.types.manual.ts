export type ID = string;

export type CurrentUser = { id: ID; identifier: string };

export type ActiveCustomer = {
  id: ID;
  emailAddress: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type GetCurrentUserData = {
  me: CurrentUser | null;
  activeCustomer: ActiveCustomer | null;
};

export type LoginVars = {
  username: string; // email or username (Vendure supports either)
  password: string;
  rememberMe?: boolean;
};

export type LoginData =
  | { login: CurrentUser }
  | {
      login: {
        __typename: "InvalidCredentialsError" | "NotVerifiedError";
        errorCode: string;
        message: string;
      };
    };

export type LogoutData = { logout: boolean };
