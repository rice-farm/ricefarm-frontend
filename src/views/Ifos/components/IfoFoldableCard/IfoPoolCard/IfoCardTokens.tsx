import React from 'react'
import {
  Text,
  Flex,
  Box,
  CheckmarkCircleIcon,
  FlexProps,
  HelpIcon,
  useTooltip,
  Button,
  AutoRenewIcon,
  BunnyPlaceholderIcon,
} from '@ricefarm/uikitv2'
import { useWeb3React } from '@web3-react/core'
import { Ifo, PoolIds, Token } from 'config/constants/types'
import tokens from 'config/constants/tokens'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import { TokenImage, TokenPairImage } from 'components/TokenImage'
import { EnableStatus } from '../types'
import PercentageOfTotal from './PercentageOfTotal'
import { SkeletonCardTokens } from './Skeletons'

interface TokenSectionProps extends FlexProps {
  primaryToken?: Token
  secondaryToken?: Token
}

const TokenSection: React.FC<TokenSectionProps> = ({ primaryToken, secondaryToken, children, ...props }) => {
  const renderTokenComponent = () => {
    if (!primaryToken) {
      return <BunnyPlaceholderIcon width={32} mr="16px" />
    }

    if (primaryToken && secondaryToken) {
      return (
        <TokenPairImage
          variant="inverted"
          primaryToken={primaryToken}
          height={32}
          width={32}
          secondaryToken={secondaryToken}
          mr="16px"
        />
      )
    }

    return <TokenImage token={primaryToken} height={32} width={32} mr="16px" />
  }

  return (
    <Flex {...props}>
      {renderTokenComponent()}
      <div>{children}</div>
    </Flex>
  )
}

// const CakeBnbTokenSection: React.FC<TokenSectionProps> = (props) => {
//   return <TokenSection primaryToken={tokens.cake} secondaryToken={tokens.wbnb} {...props} />
// }

const Label = (props) => <Text bold fontSize="12px" color="secondary" textTransform="uppercase" {...props} />

const Value = (props) => <Text bold fontSize="20px" style={{ wordBreak: 'break-all' }} {...props} />

interface IfoCardTokensProps {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
  // hasProfile: boolean
  isLoading: boolean
  onApprove: () => Promise<any>
  enableStatus: EnableStatus
}

const IfoCardTokens: React.FC<IfoCardTokensProps> = ({
  poolId,
  ifo,
  publicIfoData,
  walletIfoData,
  // hasProfile,
  isLoading,
  onApprove,
  enableStatus,
}) => {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'Sorry, you didn’t contribute enough LP tokens to meet the minimum threshold. You didn’t buy anything in this sale, but you can still reclaim your LP tokens.',
    ),
    { placement: 'bottom' },
  )

  const publicPoolCharacteristics = publicIfoData[poolId]
  const userPoolCharacteristics = walletIfoData[poolId]

  const { currency, currency2, token } = ifo
  const { hasClaimed } = userPoolCharacteristics
  const distributionRatio = ifo[poolId].distributionRatio * 100

  const primaryToken = poolId === 'poolBasic' ? tokens.teslasafe : tokens.rice
  const lpToken = (poolId === 'poolBasic' ? currency : currency2) || currency

  const renderTokenSection = () => {
    if (isLoading) {
      return <SkeletonCardTokens />
    }
    // if (account && !hasProfile) {
    //   if (publicIfoData.status === 'finished') {
    //     return <Text textAlign="center">{t('Activate PancakeSwap Profile to take part in next IFO‘s!')}</Text>
    //   }
    //   return <Text textAlign="center">{t('You need an active PancakeSwap Profile to take part in an IFO!')}</Text>
    // }
    if (publicIfoData.status === 'coming_soon') {
      return (
        <>
          <TokenSection>
            <Label>{t('Your %symbol% committed', { symbol: lpToken.symbol })}</Label>
            <Value>{getBalanceNumber(userPoolCharacteristics.amountTokenCommittedInLP, currency.decimals)}</Value>
            <PercentageOfTotal
              userAmount={userPoolCharacteristics.amountTokenCommittedInLP}
              totalAmount={publicPoolCharacteristics.totalAmountPool}
            />
          </TokenSection>
          <Text fontSize="14px" color="textSubtle" pl="48px">
            {t('%ratio%% of total sale', { ratio: distributionRatio })}
          </Text>
          {enableStatus !== EnableStatus.ENABLED && account && (
            <Button
              width="100%"
              mt="16px"
              onClick={onApprove}
              isLoading={enableStatus === EnableStatus.IS_ENABLING}
              endIcon={enableStatus === EnableStatus.IS_ENABLING ? <AutoRenewIcon spin color="currentColor" /> : null}
            >
              {t('Enable')}
            </Button>
          )}
        </>
      )
    }
    if (publicIfoData.status === 'live') {
      return (
        <>
          <TokenSection primaryToken={primaryToken} secondaryToken={tokens.wbnb} mb="24px">
            <Label>{t('Your %symbol% committed', { symbol: lpToken.symbol })}</Label>
            <Value>{getBalanceNumber(userPoolCharacteristics.amountTokenCommittedInLP, lpToken.decimals)}</Value>
            <PercentageOfTotal
              userAmount={userPoolCharacteristics.amountTokenCommittedInLP}
              totalAmount={publicPoolCharacteristics.totalAmountPool}
            />
          </TokenSection>
          <TokenSection primaryToken={ifo.token}>
            <Label>{t('%symbol% to receive', { symbol: token.symbol })}</Label>
            <Value>{getBalanceNumber(userPoolCharacteristics.offeringAmountInToken, token.decimals)}</Value>
          </TokenSection>
        </>
      )
    }
    if (publicIfoData.status === 'finished') {
      return userPoolCharacteristics.amountTokenCommittedInLP.isEqualTo(0) ? (
        <Flex flexDirection="column" alignItems="center">
          <BunnyPlaceholderIcon width={80} mb="16px" />
          <Text>{t('You didn’t participate in this sale!')}</Text>
        </Flex>
      ) : (
        <>
          <TokenSection primaryToken={primaryToken} secondaryToken={tokens.wbnb} mb="24px">
            <Label>
              {t(hasClaimed ? 'Your %symbol% RECLAIMED' : 'Your %symbol% TO RECLAIM', { symbol: lpToken.symbol })}
            </Label>
            <Flex alignItems="center">
              <Value>{getBalanceNumber(userPoolCharacteristics.refundingAmountInLP, currency.decimals)}</Value>
              {hasClaimed && <CheckmarkCircleIcon color="success" ml="8px" />}
            </Flex>
            <PercentageOfTotal
              userAmount={userPoolCharacteristics.amountTokenCommittedInLP}
              totalAmount={publicPoolCharacteristics.totalAmountPool}
            />
          </TokenSection>
          <TokenSection primaryToken={ifo.token}>
            <Label> {t(hasClaimed ? '%symbol% received' : '%symbol% to receive', { symbol: token.symbol })}</Label>
            <Flex alignItems="center">
              <Value>
                {getBalanceNumber(userPoolCharacteristics.offeringAmountInToken, token.decimals).toFixed(6)}
              </Value>
              {!hasClaimed && userPoolCharacteristics.offeringAmountInToken.isEqualTo(0) && (
                <div ref={targetRef} style={{ display: 'flex', marginLeft: '8px' }}>
                  <HelpIcon />
                </div>
              )}
              {hasClaimed && <CheckmarkCircleIcon color="success" ml="8px" />}
            </Flex>
          </TokenSection>
        </>
      )
    }
    return null
  }
  return (
    <Box pb="24px">
      {tooltipVisible && tooltip}
      {renderTokenSection()}
    </Box>
  )
}

export default IfoCardTokens
