import { Box, BoxProps, Stack, Text } from "@chakra-ui/react";

export interface UnitProps extends BoxProps {
  header: string;
  description?: string;
}

export const Unit: React.FC<UnitProps> = ({ children, header, description, bgColor = "white", color = "gray.600" }) => {
  return (
    <Box mx="auto" w="full" p="4" boxShadow={"md"} borderRadius="2xl" bgColor={bgColor}>
      <Stack spacing="4">
        <Stack spacing="1">
          <Text fontWeight={"bold"} fontSize="sm" color={color}>
            {header}
          </Text>
          {description && (
            <Text fontSize="xs" color={color}>
              {description}
            </Text>
          )}
        </Stack>
        <Box>{children}</Box>
      </Stack>
    </Box>
  );
};
