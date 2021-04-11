<template>
  <v-row
    align="center"
    justify="center"
    class="text-center pa-3"
  >
    <v-col
      cols="2"
      align-self="center"
    >
      <v-btn
        rounded
        small
        color="success"
        depressed
        outlined
      >
        <v-icon
          left
          v-text="'mdi-play'"
        />
        <span v-text="'start all'" />
      </v-btn>
    </v-col>

    <v-divider
      class="mt-4 mb-4"
      vertical
    />

    <v-col
      cols="2"
      align-self="center"
    >
      <v-btn
        rounded
        small
        color="error"
        depressed
        outlined
      >
        <v-icon
          left
          v-text="'mdi-stop'"
        />
        <span v-text="'stop all'" />
      </v-btn>
    </v-col>

    <v-divider
      class="mt-4 mb-4"
      vertical
    />

    <v-col
      cols="4"
      align-self="center"
    >
      <v-btn
        rounded
        small
        color="cyan"
        depressed
        outlined
      >
        <v-icon
          left
          v-text="'mdi-fast-forward'"
        />
        <span v-text="'initialize all'" />
      </v-btn>
    </v-col>

    <v-divider
      class="mt-4 mb-4"
      vertical
    />

    <v-col
      cols="2"
      align-self="center"
    >
      <v-btn
        rounded
        small
        color="warning"
        depressed
        outlined
      >
        <v-icon
          left
          v-text="'mdi-pencil'"
        />
        <span v-text="'edit all'" />
      </v-btn>
    </v-col>

    <v-divider
      class="mt-4 mb-4"
      vertical
    />

    <v-col
      cols="2"
      align-self="center"
    >
      <v-btn
        rounded
        small
        color="red"
        depressed
        outlined
      >
        <v-icon
          left
          v-text="'mdi-delete'"
        />
        <span v-text="'delete all'" />
      </v-btn>
    </v-col>
  </v-row>
</template>
