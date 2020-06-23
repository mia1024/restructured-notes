import {StandardProperties, StandardPropertiesHyphen, VendorProperties, VendorPropertiesHyphen} from "csstype";

declare interface CSS extends
    StandardPropertiesHyphen,
    StandardProperties,
    VendorProperties,
    VendorPropertiesHyphen
{}

export default CSS