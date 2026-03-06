declare module "naija-state-local-government" {
  interface LGAResult {
    state: string;
    lgas: string[];
  }

  function states(): string[];
  function lgas(state: string): LGAResult;

  export { states, lgas };
}