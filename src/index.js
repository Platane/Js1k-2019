/*

type Level = number
type Worker =
  | {
      x: number,
      state: "lifting",
      target: Level,
      lift: Lift,
    }
  | {
      x: number,
      y: Level,
      state: "slacking",
      slackingCountdown: number,
    }
  | {
      x: number,
      y: Level,
      state: "waiting",
      target: Level,
    }

type Lift =
  | {
      state: "traveling",
      weight: number,
      y: number,

      target: Level,
    }
  | {
      state: "echanging",
      weight: number,
      y: number,

      closeDoorCountdown: number,
    }

type Building = any[]

type World = {
  building: Building,
  lift: Lift,
  workers: Worker[],
}

*/

////////
// init
////////

const N = 5
const W = 55
const world = {
  building: Array.from({ length: N }),
  lift: {
    closeDoorCountdown: 120,
    state: "echanging",
    y: 4,
  },
  workers: Array.from({ length: W }).map((_, i) => ({
    x: 180 + Math.random() * 100,
    y: Math.floor(Math.random() * N),
    state: "waiting",
    target: Math.floor(Math.random() * N),
  })),
}

////////
// Draw
////////

const FLOOR_HEIGHT = 100
const FLOOR_WIDTH = 500

c.translate(20, 600)
c.scale(1, -1)
const drawWorld = () => {
  /**
   * clear
   */
  c.clearRect(-500, -500, 9999, 9999)

  /**
   * draw ground
   */

  c.beginPath()
  c.lineWidth = 1
  c.rect(-500, 0, 9999, 1)
  c.stroke()

  /**
   * draw buildings floors
   */
  world.building.forEach((_, i) => {
    c.rect(0, i * FLOOR_HEIGHT, FLOOR_WIDTH, FLOOR_HEIGHT)
    c.stroke()
  })

  /**
   * draw lift
   */
  c.beginPath()
  c.lineWidth = 4
  c.rect(
    LIFT_AREA[0],
    world.lift.y * FLOOR_HEIGHT,
    LIFT_AREA[1] - LIFT_AREA[0],
    FLOOR_HEIGHT
  )
  c.stroke()

  /**
   * draw workers
   */
  world.workers.forEach(worker => {
    c.beginPath()
    c.lineWidth = 4
    c.arc(worker.x, (worker.y + 0.2) * FLOOR_HEIGHT, 4, 0, Math.PI * 2)
    c.fill()
  })
}

world.workers[0].y = world.lift.y = 2

////////
// logic
////////

const computeNextStop = () => Math.floor(Math.random() * world.building.length)

const LIFT_VELOCITY = 0.02
const WORKER_VELOCITY = 1
const LIFT_CLOSE_DOOR_COUNTDOWN = 30
const WORKER_SLACKING_COUNTDOWN = 30
const LIFT_AREA = [50, 120]
const LIFT_BORDING_ZONE = 20

const step = () => {
  const { lift, workers } = world

  /**
   * lift logic
   */
  if (lift.state === "traveling") {
    lift.y += (lift.target < lift.y ? -1 : 1) * LIFT_VELOCITY

    if (Math.abs(lift.y - lift.target) < LIFT_VELOCITY) {
      lift.y = lift.target
      lift.state = "echanging"
      lift.closeDoorCountdown = LIFT_CLOSE_DOOR_COUNTDOWN
    }
  }

  if (lift.state === "echanging") {
    if (lift.closeDoorCountdown-- < 0) {
      lift.state = "traveling"
      lift.target = computeNextStop()
    }
  }

  /**
   * workers logic
   */

  workers.forEach(worker => {
    /**
     * slacking
     */
    if (worker.state === "slacking") {
      worker.x += (worker.target > worker.x ? 1 : -1) * WORKER_VELOCITY

      if (Math.abs(worker.target - worker.x) < WORKER_VELOCITY) {
        worker.target = LIFT_AREA[1] + 20 + Math.random() * 150

        if (worker.slackingCountdown-- < 0) {
          worker.state = "waiting"
          worker.target = Math.floor(Math.random() * world.building.length)
        }
      }
    }

    /**
     * reach it's level
     */
    if (worker.state === "waiting" && worker.target === worker.y) {
      worker.state = "slacking"
      worker.target = worker.x
      worker.slackingCountdown = WORKER_SLACKING_COUNTDOWN
    }

    /**
     * board the lift
     */
    if (
      worker.state === "waiting" &&
      lift.state === "echanging" &&
      lift.y === worker.y
    ) {
      const t = (LIFT_AREA[0] + LIFT_AREA[1]) / 2
      worker.x += (t > worker.x ? 1 : -1) * WORKER_VELOCITY

      if (LIFT_AREA[0] < worker.x && worker.x < LIFT_AREA[1]) {
        worker.state = "lifting"
        worker.lift = lift
        lift.closeDoorCountdown = LIFT_CLOSE_DOOR_COUNTDOWN
      }
    }

    /**
     * unboard the lift
     */
    if (
      worker.state === "lifting" &&
      worker.lift.state === "echanging" &&
      lift.y === worker.target
    ) {
      const t = (LIFT_AREA[0] + LIFT_AREA[1]) / 2
      worker.x += (t < worker.x ? 1 : -1) * WORKER_VELOCITY

      if (worker.x < LIFT_AREA[0] || LIFT_AREA[1] < worker.x) {
        worker.state = "waiting"
        worker.lift = null
        worker.y = worker.target
        lift.closeDoorCountdown = LIFT_CLOSE_DOOR_COUNTDOWN
      }
    }
    if (worker.state === "lifting") worker.y = lift.y
  })
}

////////
// loop
////////

const loop = () => {
  step()
  drawWorld()

  requestAnimationFrame(loop)
}
loop()
