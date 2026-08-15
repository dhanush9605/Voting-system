export let globalSignOut: () => void = () => {};

export const setGlobalSignOut = (fn: () => void) => {
    globalSignOut = fn;
};
