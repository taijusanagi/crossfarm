import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useState } from "react";
import Confetti from "react-confetti";
import { useReward } from "react-rewards";
import useWindowSize from "react-use/lib/useWindowSize";
import { useAccount } from "wagmi";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";
import { useAccountTokenAmount } from "@/hooks/useAccountTokenAmount";
import { useAddresses } from "@/hooks/useAddresses";
import { useAPY } from "@/hooks/useAPY";
import { useChainId } from "@/hooks/useChainId";
import { useContracts } from "@/hooks/useContracts";
import { useIsWagmiConnected } from "@/hooks/useIsWagmiConnected";
import { axelar, getAxelarNetwork, getAxelarToken } from "@/lib/axelar";

import networkJsonFile from "../../../contracts/network.json";
import { ChainId, isChainId } from "../../../contracts/types/ChainId";

const HomePage: NextPage = () => {
  const { chainId } = useChainId();
  const contracts = useContracts();
  const { address: userAddress } = useAccount();
  const addresses = useAddresses();
  const { width, height } = useWindowSize();
  const { isWagmiConnected } = useIsWagmiConnected();
  const {
    isAccountTokenAmountLoading,
    isAccountTokenAmountEnough,
    isAccountStakedAmountEnough,
    accountTokenAmount,
    accountStakedAmount,
    fetchAccountTokens,
  } = useAccountTokenAmount();
  const apy = useAPY();
  const plantModalDisclosure = useDisclosure();
  const harvestModalDisclosure = useDisclosure();
  const confettiDisclosure = useDisclosure();
  const [plantModalStatus, setPlantModalStatus] = useState<
    "selectAsset" | "inputAmount" | "selectNetwork" | "preview" | "result"
  >("selectAsset");
  const [harvestModalStatus, setHarvestModalStatus] = useState<
    "selectAsset" | "inputAmount" | "selectNetwork" | "preview" | "result"
  >("selectAsset");
  const [asset] = useState("aUSDC");
  const [inputPlantAmount, setInputPlantAmount] = useState("0.1");
  const [inputHarvestAmount, setInputHarvestAmount] = useState("0.1");
  const [selectedChainId, setSelectedChainId] = useState<ChainId>("97");

  const [txHash, setTxHash] = useState("");

  const [isTxSending, setIsTxSending] = useState(false);

  const setSelectedChainIdWithTypeCheck = (chainId: string) => {
    if (!isChainId(chainId)) {
      return;
    }
    setSelectedChainId(chainId);
  };

  const plant = async () => {
    if (!chainId || !contracts || !addresses || !userAddress) {
      return;
    }
    try {
      setIsTxSending(true);
      const parsedInputAmount = ethers.utils.parseUnits(inputPlantAmount, 6);
      console.log("plant with cross-chain bridge");
      const allowance = await contracts.token.allowance(userAddress, contracts.crossFarm.address);
      console.log("allowance", allowance);
      if (allowance.lt(parsedInputAmount)) {
        console.log("allowance is not enough, please approve");
        const approveTx = await contracts.token.approve(contracts.crossFarm.address, parsedInputAmount);
        console.log("approve tx sent", approveTx.hash);
        await approveTx.wait();
        console.log("approve tx confirmed");
      }
      console.log("bridge fee estimation...");
      const estimatedFasFeeForBridge = await axelar.query.estimateGasFee(
        getAxelarNetwork(chainId),
        getAxelarNetwork(selectedChainId),
        getAxelarToken(chainId),
        1000000
      );
      console.log("bridge fee estimated", estimatedFasFeeForBridge);
      const process = await contracts.crossFarm.process(
        "0",
        getAxelarNetwork(selectedChainId),
        networkJsonFile[selectedChainId].deployments.crossFarm,
        asset,
        parsedInputAmount,
        networkJsonFile[selectedChainId].deployments.vault,
        { value: estimatedFasFeeForBridge }
      );
      console.log("process tx sent", process.hash);
      await process.wait();
      setTxHash(process.hash);
      setPlantModalStatus("result");
      confettiDisclosure.onOpen();
      console.log("process tx confirmed");
    } catch (e) {
      console.error(e);
    } finally {
      setIsTxSending(false);
    }
  };

  const harvest = async () => {
    if (!chainId || !contracts || !addresses || !userAddress) {
      return;
    }
    try {
      setIsTxSending(true);
      const parsedInputAmount = ethers.utils.parseUnits(inputHarvestAmount, 6);
      console.log("plant with cross-chain bridge");
      const allowance = await contracts.vault.allowance(userAddress, contracts.crossFarm.address);
      console.log("allowance", allowance);
      if (allowance.lt(parsedInputAmount)) {
        console.log("allowance is not enough, please approve");
        const approveTx = await contracts.vault.approve(contracts.crossFarm.address, parsedInputAmount);
        console.log("approve tx sent", approveTx.hash);
        await approveTx.wait();
        console.log("approve tx confirmed");
      }
      console.log("bridge fee estimation...");
      const estimatedFasFeeForBridge = await axelar.query.estimateGasFee(
        getAxelarNetwork(chainId),
        getAxelarNetwork(selectedChainId),
        getAxelarToken(chainId),
        1000000
      );
      console.log("bridge fee estimated", estimatedFasFeeForBridge);
      const process = await contracts.crossFarm.process(
        "1",
        getAxelarNetwork(selectedChainId),
        networkJsonFile[selectedChainId].deployments.crossFarm,
        asset,
        parsedInputAmount,
        networkJsonFile[selectedChainId].deployments.vault,
        { value: estimatedFasFeeForBridge }
      );
      console.log("process tx sent", process.hash);
      await process.wait();
      setTxHash(process.hash);
      setHarvestModalStatus("result");
      confettiDisclosure.onOpen();
      console.log("process tx confirmed");
    } catch (e) {
      console.error(e);
    } finally {
      setIsTxSending(false);
    }
  };

  return (
    <DefaultLayout>
      {confettiDisclosure.isOpen && <Confetti width={width} height={height} />}
      <Unit header="CrossFarm" description="Auto cross-chain yield aggregator with Axelar">
        <Stack>
          <Flex justify="space-between">
            <Button
              fontWeight={"bold"}
              onClick={() => {
                setPlantModalStatus("selectAsset");
                fetchAccountTokens();
                plantModalDisclosure.onOpen();
              }}
              colorScheme={"brand"}
              disabled={!isWagmiConnected}
            >
              Plant
            </Button>
            <Button
              fontWeight={"bold"}
              onClick={() => {
                setHarvestModalStatus("selectAsset");
                fetchAccountTokens();
                harvestModalDisclosure.onOpen();
              }}
              colorScheme={"brand"}
              disabled={!isWagmiConnected}
            >
              Harvest
            </Button>
          </Flex>
          <Box py="24">
            <Center h="200" position="relative">
              <Image src="/img/base.png" alt="base" h="200" position="absolute" top="0" />
              <Image src="/img/corn.png" alt="corn" h="12" position="absolute" top="10" />
            </Center>
          </Box>
        </Stack>
      </Unit>
      <Modal
        header="Plant"
        isOpen={plantModalDisclosure.isOpen}
        onClose={() => {
          confettiDisclosure.onClose();
          plantModalDisclosure.onClose();
          setIsTxSending(false);
          setHarvestModalStatus("selectAsset");
        }}
      >
        {plantModalStatus === "selectAsset" && (
          <Stack spacing="4">
            <Button
              fontWeight={"bold"}
              isLoading={isAccountTokenAmountLoading}
              loadingText={"Loading"}
              disabled={!isAccountTokenAmountEnough}
              onClick={() => setPlantModalStatus("inputAmount")}
            >
              {asset} {!isAccountTokenAmountEnough ? "( Not Enough )" : `( ${accountTokenAmount} )`} {}
            </Button>
            <Text fontSize="sm" color="gray.500">
              * Please get testnet aUSDC from in <Link color="blue.500">Axelar Discord</Link> faucet channel
            </Text>
          </Stack>
        )}
        {plantModalStatus === "inputAmount" && (
          <Stack spacing="4">
            <FormControl>
              <Flex justify={"space-between"}>
                <FormLabel fontSize="md">Amount</FormLabel>
                <FormLabel fontSize="md">Max: {accountTokenAmount}</FormLabel>
              </Flex>
              <Input
                type="number"
                placeholder={"aUSDC"}
                value={inputPlantAmount}
                onChange={(e) => setInputPlantAmount(e.target.value)}
              />
            </FormControl>
            <HStack>
              <Button fontWeight={"bold"} w="full" onClick={() => setPlantModalStatus("selectAsset")}>
                Back
              </Button>
              <Button
                fontWeight={"bold"}
                w="full"
                disabled={!inputPlantAmount}
                onClick={() => setPlantModalStatus("selectNetwork")}
                colorScheme="brand"
              >
                Next
              </Button>
            </HStack>
          </Stack>
        )}
        {plantModalStatus === "selectNetwork" && (
          <Stack spacing="8">
            <FormControl>
              <RadioGroup onChange={setSelectedChainIdWithTypeCheck} value={selectedChainId}>
                <Stack spacing="4">
                  {Object.entries(networkJsonFile)
                    .filter(([key]) => chainId !== key)
                    .map(([key, value]) => {
                      return (
                        <Radio key={key} value={key}>
                          {value.name} - {apy[key]}%
                        </Radio>
                      );
                    })}
                </Stack>
              </RadioGroup>
            </FormControl>
            <HStack>
              <Button fontWeight={"bold"} w="full" onClick={() => setPlantModalStatus("inputAmount")}>
                Back
              </Button>
              <Button fontWeight={"bold"} w="full" onClick={() => setPlantModalStatus("preview")} colorScheme="brand">
                Next
              </Button>
            </HStack>
          </Stack>
        )}
        {plantModalStatus === "preview" && (
          <Stack spacing="8">
            <Stack spacing="2">
              <Stack spacing="1">
                <Text fontSize="md" fontWeight={"bold"}>
                  Amount
                </Text>
                <Text fontSize="md">{inputPlantAmount} aUSDC</Text>
              </Stack>
              <Stack spacing="1">
                <Text fontSize="md" fontWeight={"bold"}>
                  Source Chain
                </Text>
                <Text fontSize="md">{chainId && networkJsonFile[chainId].name}</Text>
              </Stack>
              {chainId !== selectedChainId && (
                <>
                  <Stack spacing="1">
                    <Text fontSize="md" fontWeight={"bold"}>
                      Target Chain
                    </Text>
                    <Text fontSize="md">{networkJsonFile[selectedChainId].name}</Text>
                  </Stack>
                  <Stack spacing="1">
                    <Text fontSize="md" fontWeight={"bold"}>
                      Bridge Protocol
                    </Text>
                    <Text fontSize="md">Axelar</Text>
                  </Stack>
                </>
              )}
              <Stack spacing="1">
                <Text fontSize="md" fontWeight={"bold"}>
                  Expected APY
                </Text>
                <Text fontSize="md">{apy[selectedChainId]}%</Text>
              </Stack>
            </Stack>
            <HStack>
              <Button
                fontWeight={"bold"}
                w="full"
                onClick={() => setPlantModalStatus("selectNetwork")}
                isDisabled={isTxSending}
              >
                Back
              </Button>
              <Button fontWeight={"bold"} w="full" onClick={plant} colorScheme="brand" isLoading={isTxSending}>
                Confirm
              </Button>
            </HStack>
          </Stack>
        )}
        {plantModalStatus === "result" && (
          <Stack spacing="8">
            <Stack>
              <Text fontSize="lg" fontWeight={"bold"}>
                Congratulation!
              </Text>
              <Text fontSize="md">You sent a cross-chain staking tx with Axelar</Text>
            </Stack>
            <HStack>
              <Button
                fontWeight={"bold"}
                w="full"
                onClick={async () => {
                  window.open(`https://testnet.axelarscan.io/gmp/${txHash}`, "_blank");
                  plantModalDisclosure.onClose();
                }}
                colorScheme="brand"
              >
                View
              </Button>
            </HStack>
          </Stack>
        )}
      </Modal>

      <Modal header="Harvest" isOpen={harvestModalDisclosure.isOpen} onClose={harvestModalDisclosure.onClose}>
        {harvestModalStatus === "selectAsset" && (
          <Stack spacing="4">
            <Button
              isLoading={isAccountTokenAmountLoading}
              loadingText={"Loading"}
              disabled={!isAccountStakedAmountEnough}
              onClick={() => setHarvestModalStatus("inputAmount")}
              fontWeight={"bold"}
            >
              {asset} {!isAccountStakedAmountEnough ? "( Not Enough )" : `( ${accountStakedAmount} )`}
            </Button>
          </Stack>
        )}
        {harvestModalStatus === "inputAmount" && (
          <Stack spacing="4">
            <FormControl>
              <Flex justify={"space-between"}>
                <FormLabel fontSize="md">Amount</FormLabel>
                <FormLabel fontSize="md">Max: {accountStakedAmount}</FormLabel>
              </Flex>
              <Input
                type="number"
                placeholder={"aUSDC"}
                value={inputHarvestAmount}
                onChange={(e) => setInputHarvestAmount(e.target.value)}
              />
            </FormControl>
            <HStack>
              <Button fontWeight={"bold"} w="full" onClick={() => setHarvestModalStatus("selectAsset")}>
                Back
              </Button>
              <Button
                fontWeight={"bold"}
                w="full"
                disabled={!inputHarvestAmount}
                onClick={() => setHarvestModalStatus("selectNetwork")}
                colorScheme="brand"
              >
                Next
              </Button>
            </HStack>
          </Stack>
        )}
        {harvestModalStatus === "selectNetwork" && (
          <Stack spacing="8">
            <FormControl>
              <RadioGroup onChange={setSelectedChainIdWithTypeCheck} value={selectedChainId}>
                <Stack spacing="4">
                  {Object.entries(networkJsonFile)
                    .filter(([key]) => chainId !== key)
                    .map(([key, value]) => {
                      return (
                        <Radio key={key} value={key}>
                          {value.name}
                        </Radio>
                      );
                    })}
                </Stack>
              </RadioGroup>
            </FormControl>
            <HStack>
              <Button
                fontWeight={"bold"}
                w="full"
                disabled={!inputHarvestAmount}
                onClick={() => setHarvestModalStatus("selectAsset")}
              >
                Back
              </Button>
              <Button
                fontWeight={"bold"}
                w="full"
                disabled={!inputHarvestAmount}
                onClick={() => setHarvestModalStatus("preview")}
                colorScheme="brand"
              >
                Next
              </Button>
            </HStack>
          </Stack>
        )}
        {harvestModalStatus === "preview" && (
          <Stack spacing="8">
            <Stack spacing="2">
              <Stack spacing="1">
                <Text fontSize="md" fontWeight={"bold"}>
                  Amount
                </Text>
                <Text fontSize="md">
                  {inputHarvestAmount} {asset}
                </Text>
              </Stack>
              <Stack spacing="1">
                <Text fontSize="md" fontWeight={"bold"}>
                  Bridge Protocol
                </Text>
                <Text fontSize="md">Axelar</Text>
              </Stack>
              {chainId !== selectedChainId && (
                <>
                  <Stack spacing="1">
                    <Text fontSize="md" fontWeight={"bold"}>
                      Source Chain
                    </Text>
                    <Text fontSize="md">{chainId && networkJsonFile[chainId].name}</Text>
                  </Stack>
                  <Stack spacing="1">
                    <Text fontSize="md" fontWeight={"bold"}>
                      Target Chain
                    </Text>
                    <Text fontSize="md">{networkJsonFile[selectedChainId].name}</Text>
                  </Stack>
                </>
              )}
            </Stack>
            <HStack>
              <Button
                fontWeight={"bold"}
                w="full"
                disabled={!inputHarvestAmount}
                onClick={() => setHarvestModalStatus("inputAmount")}
              >
                Back
              </Button>
              <Button fontWeight={"bold"} w="full" disabled={!inputHarvestAmount} onClick={harvest} colorScheme="brand">
                Confirm
              </Button>
            </HStack>
          </Stack>
        )}
      </Modal>
    </DefaultLayout>
  );
};

export default HomePage;
