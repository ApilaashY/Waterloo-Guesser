import LaunchPage from '../../launch/page'

export default function DynamicLaunch({ params }: { params: { id: string } }) {
  const { id } = params
  return <LaunchPage routeId={id} />
}
