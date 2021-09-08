import React, { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import {
  Card,
  CardBody,
  Text,
  Flex,
  HelpIcon,
  Button,
  Heading,
  Skeleton,
  useModal,
  Box,
  useTooltip,
  TimerIcon,
} from '@ricefarm/uikitv2'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useCakeVault } from 'state/pools/hooks'
import Balance from 'components/Balance'
import BountyModal from './BountyModal'
import CompoundTimerModal from './CakeVaultCard/CompoundTimerModal'

const TimerIconLink = styled(TimerIcon)`
  cursor: pointer;
`

const StyledCard = styled(Card)`
  width: 100%;
  background-image: url(/images/vault-header.svg);
  background-repeat: no-repeat;
  background-size: 120px;
  background-position: left center;
  background-color: transparent;
  border-radius: 0px;
  padding-left: 120px;

  > div {
    background-color: ${({ theme }) => theme.colors.background};
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 240px;
  }
`

const BountyCard = () => {
  const { t } = useTranslation()
  const {
    canHarvest,
    nextHarvestUntil,
    estimatedCakeBountyReward,
    fees: { callFee },
  } = useCakeVault()
  const cakePriceBusd = usePriceCakeBusd()
  const cakePriceBusdAsNumber = cakePriceBusd.toNumber()

  const estimatedDollarBountyReward = useMemo(() => {
    return new BigNumber(estimatedCakeBountyReward).multipliedBy(cakePriceBusdAsNumber)
  }, [cakePriceBusdAsNumber, estimatedCakeBountyReward])

  const hasFetchedDollarBounty = estimatedDollarBountyReward.gte(0)
  const hasFetchedCakeBounty = estimatedCakeBountyReward ? estimatedCakeBountyReward.gte(0) : false
  const dollarBountyToDisplay = hasFetchedDollarBounty ? getBalanceNumber(estimatedDollarBountyReward, 18) : 0
  const cakeBountyToDisplay = hasFetchedCakeBounty ? getBalanceNumber(estimatedCakeBountyReward, 18) : 0

  const TooltipComponent = ({ fee }: { fee: number }) => (
    <>
      <Text mb="16px">{t('This bounty is given as a reward for providing a service to other users.')}</Text>
      <Text mb="16px">
        {t(
          'Whenever you successfully claim the bounty, you’re also helping out by activating the Auto RICE Pool’s compounding function for everyone.',
        )}
      </Text>
      <Text color="#0000FF" mb="16px">
        {t(
          'Anyone staked in the vault can claim the bounty but only 1 lucky person actually receives the reward. Compound at your own risk!',
        )}
      </Text>
      <Text style={{ fontWeight: 'bold' }}>
        {t('Auto-Compound Bounty: %fee%% of all Auto RICE pool users pending yield', { fee: fee / 100 })}
      </Text>
    </>
  )

  const [onHarvestTimer] = useModal(<CompoundTimerModal pid={0} nextHarvestUntil={nextHarvestUntil.toString()} />)
  const [onPresentBountyModal] = useModal(<BountyModal callFee={callFee} TooltipComponent={TooltipComponent} />)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent fee={callFee} />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  return (
    <>
      {tooltipVisible && tooltip}
      <StyledCard>
        <CardBody>
          <Flex flexDirection="column">
            <Flex alignItems="center" mb="12px">
              <Text fontSize="16px" bold color="textSubtle" mr="4px">
                {t('Compound For All Bounty')}
              </Text>
              <Box ref={targetRef}>
                <HelpIcon color="textSubtle" />
              </Box>
            </Flex>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Flex flexDirection="column" mr="12px">
              <Heading>
                {hasFetchedCakeBounty ? (
                  <Balance fontSize="20px" bold value={cakeBountyToDisplay} decimals={3} />
                ) : (
                  <Skeleton height={20} width={96} mb="2px" />
                )}
              </Heading>
              {hasFetchedDollarBounty ? (
                <Balance
                  fontSize="12px"
                  color="textSubtle"
                  value={dollarBountyToDisplay}
                  decimals={2}
                  unit=" USD"
                  prefix="~"
                />
              ) : (
                <Skeleton height={16} width={62} />
              )}
            </Flex>
            {!canHarvest && dollarBountyToDisplay && cakeBountyToDisplay && callFee ? (
              <TimerIconLink onClick={onHarvestTimer} />
            ) : null}
            <Button
              disabled={!dollarBountyToDisplay || !cakeBountyToDisplay || !callFee || !canHarvest}
              onClick={onPresentBountyModal}
              scale="sm"
            >
              {t('Compound')}
            </Button>
          </Flex>
        </CardBody>
      </StyledCard>
    </>
  )
}

export default BountyCard
