const BEM_MODIFIER_DELIMITER = '__';
const BEM_ELEMENT_DELIMETER = '_';

export const stringSpacesToArray = (spacedClasses) => spacedClasses.split(' ');
export const removeDupes = array => [...new Set(array)];
export const removeDupesWithNesting = array => removeDupes(stringSpacesToArray(array.join(' ')))

/*
 * Creates a function which applies (or does not apply) a BEM modifier to a class when a given
 * condition is true.
 * 
 * Example usage: 
 *   const isMobile = ...;
 *   const mobileWrapper = bemConditionalModifier('mobile');
 *   const elementClassName = mobileWrapper(isMobile, 'standard-name')
 * 
 * Then elementClassName will either be "standard-name" or "standard-name__mobile", depending on
 * whether or not isMobile was true.
 */
export const bemConditionalModifier = (conditionalName) => {
  return (condition, ...baseNames) => {
    const classes = baseNames.flat().map(x => stringSpacesToArray(x)).flat();
    const result = condition ? stringSpacesToArray(bemApplyModifier(conditionalName, classes)) : classes;
    return removeDupes(result).join(' ');
  }
};

/*
 * Directly applies the modifier parameter as a modifier to each of the class
 * names contained in baseNames.
 */
export const bemApplyModifier = (modifier, ...baseNames) => {
  const classes = baseNames.flat().map(x => stringSpacesToArray(x)).flat();
  return removeDupes([
    ...classes, 
    ...classes.map(name => name + BEM_MODIFIER_DELIMITER + modifier)
  ]).join(' ');
};

/*
 * Creates a function that directly applies the modifier parameter as a modifier to each
 * of the class names contained in baseNames. Useful if the same modifier will be applied to
 * several groups of classes, so that the modifier will not need to be passed repeatedly.
 */
export const bemApplyModifierFactory = (modifier) => {
  return (...baseNames) => bemApplyModifier(modifier, baseNames);
};

/*
 * Additional wrapper on top of the conditional wrapper which applies the condition specified
 * automatically. Useful when the value of the condition is the same across several usages.
 * 
 * Example usage:
 *   const isMobile = ...;
 *   const mobileWrapper = createKnownBemModifierApplier(isMobile, 'mobile');
 *   const elementClassName = mobileWrapper('standard-name');
 * 
 * Same as in the conditional case, elementClassName will either be "standard-name" or "standard-name__mobile", depending on
 * whether or not isMobile was true. However, now we don't have to re-specify isMobile in every call.
 */
export const bemKnownModifierApplier = (conditionalName, condition) => {
  const conditionalWrapper = bemConditionalModifier(conditionalName);
  return (...baseNames) => conditionalWrapper(condition, baseNames);
};

/*
 * Creates a wrapper to apply a block name to elements.
 *
 * Example usage given a block named 'gallery' with elements 'scroll-bar' and 'header-image':
 *   const galleryBlock = createBlockWrapper('gallery');
 *   const scrollBarClass = galleryBlock('scroll-bar'); // result of gallery_scroll-bar
 *   const headerImageClass = galleryBlock('header-image'); // result of gallery_header-image
 * 
 * Now if the block name should change, it can all be done once by modifying the parameter of galleryBlock.
 */
export const createBlockWrapper = (blockName) => {
  return (...classes) => {
    // iterate over all class names specified, apply the block to each of them and remove duplicates
    return removeDupes(
      classes.flat().map(x => stringSpacesToArray(x))
        .flat()
        .map(elementName => elementName ? blockName + BEM_ELEMENT_DELIMETER + elementName : blockName)
    ).join(' ');
  };
};