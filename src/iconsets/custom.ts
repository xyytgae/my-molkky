import { h } from 'vue'
import type { IconSet, IconProps } from 'vuetify'
import skittles from '~/components/icons/Skittles.vue'

const customSvgToComponent: any = {
  skittles,
}

const custom: IconSet = {
  component: (props: IconProps) =>
    h(props.tag, [
      h(customSvgToComponent[props.icon as string], {
        class: 'v-icon__svg',
      }),
    ]),
}

export { custom }
