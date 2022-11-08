import { Box, BoxProps, Stack, Text } from "@chakra-ui/react";

export interface UnitProps extends BoxProps {
  header: string;
  description: string;
}

export const Unit: React.FC<UnitProps> = ({ children, header, description }) => {
  return (
    <Box mx="auto" p="6" boxShadow={"md"} borderRadius="2xl" bgColor={"white"}>
      <Stack spacing="4">
        <Stack spacing="1">
          <Text fontWeight={"bold"} fontSize="sm" color="gray.600">
            {header}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {description}
          </Text>
        </Stack>
        <Box>{children}</Box>
      </Stack>
    </Box>
  );
};
