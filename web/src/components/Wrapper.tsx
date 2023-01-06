import React from "react";
import { Box } from "@chakra-ui/react";

export type WrapperVariant = 'small' | 'regualar'

interface WrapperProps {
    variant?: WrapperVariant;
    children: any
}

export const Wrapper: React.FC<WrapperProps> = ({ 
    children,
    variant = 'regualar',
 }) => {
    return (
      <Box 
        mt={8} 
        mx='auto' 
        maxW={ variant === "regular" ? "800px" : "400px" } 
        w="100%"
        >
        {children}
      </Box>
    );
};