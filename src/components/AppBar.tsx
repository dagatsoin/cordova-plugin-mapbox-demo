import React from 'react'
import { defaultTheme, View, Text } from '@sproutch/ui'

type Props = {
  title: string
}

export default function ({ title }: Props) {
  return <View style={{
    backgroundColor: defaultTheme.palette.primary.main,
    height: 48,
    alignContent: 'center',
    justifyContent: 'center'
  }}>
    <Text style={{
      color: defaultTheme.palette.primary.contrastText,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold'
    }}>
      {title.toUpperCase()}
    </Text>
  </View>
}
