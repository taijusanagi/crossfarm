import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";
import { useAccountTokenAmount } from "@/hooks/useAccountTokenAmount";
import { useAPY } from "@/hooks/useAPY";
import { useChainId } from "@/hooks/useChainId";
import { ChainId, isChainId } from "@/types/ChainId";

import network from "../../../contracts/network.json";

const HomePage: NextPage = () => {
  const { chainId } = useChainId();
  const { isAccountTokenAmountLoading, isAccountTokenAmountEnough, accountTokenAmount, fetchAccountTokenAmount } =
    useAccountTokenAmount();
  const plantModalDisclosure = useDisclosure();
  const [plantModalStatus, setPlantModalStatus] = useState<"selectAsset" | "inputAmount" | "selectFarm" | "preview">(
    "selectAsset"
  );
  const [inputAmount, setInputAmount] = useState("1");
  const [selectedChainId, setSelectedChainId] = useState<ChainId>("80001");
  const apy = useAPY();

  const setSelectedChainIdWithTypeCheck = (chainId: string) => {
    if (!isChainId(chainId)) {
      return;
    }
    setSelectedChainId(chainId);
  };

  const onClickPlant = () => {
    setPlantModalStatus("selectAsset");
    fetchAccountTokenAmount();
    plantModalDisclosure.onOpen();
  };

  return (
    <DefaultLayout>
      <Stack spacing="4">
        <Flex justify="right">
          <Box>
            <Button
              onClick={onClickPlant}
              colorScheme="brand"
              size="sm"
              rightIcon={chainId === "5" ? <AiOutlinePlus /> : undefined}
              disabled={chainId !== "5"}
            >
              {chainId !== "5" ? "Connect Georli" : "plant"}
            </Button>
            <Modal header="Plant Asset" isOpen={plantModalDisclosure.isOpen} onClose={plantModalDisclosure.onClose}>
              {plantModalStatus === "selectAsset" && (
                <Stack spacing="4">
                  <Button
                    p="4"
                    boxShadow={"md"}
                    borderRadius="2xl"
                    fontSize="sm"
                    isLoading={isAccountTokenAmountLoading}
                    loadingText={"Loading"}
                    disabled={!isAccountTokenAmountEnough}
                    onClick={() => setPlantModalStatus("inputAmount")}
                  >
                    aUSDC {!isAccountTokenAmountEnough && "( Not Enough )"}
                  </Button>
                </Stack>
              )}
              {plantModalStatus === "inputAmount" && (
                <Stack spacing="4">
                  <FormControl>
                    <Flex justify={"space-between"}>
                      <FormLabel>Amount</FormLabel>
                      <FormLabel fontSize="xs">Max: {accountTokenAmount}</FormLabel>
                    </Flex>
                    <Input
                      type="number"
                      placeholder={"aUSDC"}
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                    />
                  </FormControl>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setPlantModalStatus("selectAsset")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setPlantModalStatus("selectFarm")}
                      colorScheme="brand"
                    >
                      Next
                    </Button>
                  </HStack>
                </Stack>
              )}
              {plantModalStatus === "selectFarm" && (
                <Stack spacing="8">
                  <FormControl>
                    <RadioGroup onChange={setSelectedChainIdWithTypeCheck} value={selectedChainId}>
                      <Stack>
                        <Radio value="80001">Polygon Mumbai - {apy["80001"]}%</Radio>
                        <Radio value="97">BNB Testnet - {apy["97"]}%</Radio>
                        <Radio value="4002">Fantom Testnet - {apy["4002"]}%</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setPlantModalStatus("inputAmount")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setPlantModalStatus("preview")}
                      colorScheme="brand"
                    >
                      Next
                    </Button>
                  </HStack>
                </Stack>
              )}
              {plantModalStatus === "preview" && (
                <Stack spacing="8">
                  <Stack spacing="2">
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Amount
                      </Text>
                      <Text fontSize="sm">{inputAmount} aUSDC</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Bridge Protocol
                      </Text>
                      <Text fontSize="sm">Axelar</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Source Chain
                      </Text>
                      <Text fontSize="sm">Georli</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Target Chain
                      </Text>
                      <Text fontSize="sm">{network[selectedChainId].name}</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Expected APY
                      </Text>
                      <Text fontSize="sm">{apy[selectedChainId]}%</Text>
                    </Stack>
                  </Stack>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setPlantModalStatus("selectFarm")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => console.log("confirm")}
                      colorScheme="brand"
                    >
                      Confirm
                    </Button>
                  </HStack>
                </Stack>
              )}
            </Modal>
          </Box>
        </Flex>

        <Unit header="Farm Overview" description="Your staking overview is visualized">
          Farm Overview
        </Unit>
        <Unit header="Farm Detail" description="Your staking detail">
          Farm Detail
        </Unit>
      </Stack>
    </DefaultLayout>
  );
};

export default HomePage;
