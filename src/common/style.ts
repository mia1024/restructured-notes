import {StandardProperties, StandardPropertiesHyphen, VendorProperties, VendorPropertiesHyphen} from "csstype";

export interface CSS extends
    StandardPropertiesHyphen,
    StandardProperties,
    VendorProperties,
    VendorPropertiesHyphen
{}
