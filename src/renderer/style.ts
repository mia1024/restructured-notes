import {StandardProperties, StandardPropertiesHyphen, VendorProperties, VendorPropertiesHyphen} from "csstype";

export default interface Style extends
    StandardPropertiesHyphen,
    StandardProperties,
    VendorProperties,
    VendorPropertiesHyphen
{}

export {Style}