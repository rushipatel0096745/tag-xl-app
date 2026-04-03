import { View, Text } from 'react-native'
import React from 'react'
import AssetList from '@/components/assets/AssetList'

const AssetListView = () => {
  return (
    <View className='flex-1'>
      <AssetList />
    </View>
  )
}

export default AssetListView